'use client'

import React, { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { useBiometric } from '@/context/BiometricContext'
import type { FocusLevel } from '@/types/biometric'

// MediaPipe landmark indices for EAR calculation
const LEFT_EYE = [362, 385, 387, 263, 373, 380]
const RIGHT_EYE = [33, 160, 158, 133, 153, 144]
// Nose tip for gaze proxy
const NOSE_TIP = 1
const FACE_LEFT = 234
const FACE_RIGHT = 454

type LandmarkPoint = { x: number; y: number; z: number }

function dist(a: LandmarkPoint, b: LandmarkPoint) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function calcEAR(lm: LandmarkPoint[], indices: number[]) {
  // EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
  const [p1, p2, p3, p4, p5, p6] = indices.map((i) => lm[i])
  const vertical = dist(p2, p6) + dist(p3, p5)
  const horizontal = 2 * dist(p1, p4)
  return horizontal > 0 ? vertical / horizontal : 0
}

function gazeFromLandmarks(lm: LandmarkPoint[]): { direction: string; x: number; y: number } {
  const nose = lm[NOSE_TIP]
  const faceLeft = lm[FACE_LEFT]
  const faceRight = lm[FACE_RIGHT]
  const faceWidth = faceRight.x - faceLeft.x
  const faceCenter = (faceLeft.x + faceRight.x) / 2

  const normX = faceWidth > 0 ? (nose.x - faceCenter) / faceWidth : 0
  const normY = nose.y - 0.5

  let direction = 'center'
  if (normX > 0.08) direction = 'right'
  else if (normX < -0.08) direction = 'left'
  else if (normY < -0.04) direction = 'up'
  else if (normY > 0.04) direction = 'down'

  return { direction, x: normX, y: normY }
}

function computeEngagement(avgEAR: number, gazeDirection: string): number {
  // Normalize EAR: open eye ~0.25-0.35, closed < 0.18
  const earScore = Math.min(1, Math.max(0, (avgEAR - 0.15) / 0.2))
  const gazeFactor = gazeDirection === 'center' ? 1.0 : gazeDirection === 'up' ? 0.75 : 0.55
  return Math.round(earScore * gazeFactor * 100) / 100
}

function focusFromEngagement(score: number): FocusLevel {
  if (score >= 0.65) return 'high'
  if (score >= 0.38) return 'medium'
  if (score > 0) return 'low'
  return 'unknown'
}

export default function VisionTracker() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const { updateBiometric } = useBiometric()
  const updateRef = useRef(updateBiometric)
  updateRef.current = updateBiometric

  useEffect(() => {
    let faceLandmarker: FaceLandmarker | null = null
    let animationFrameId: number
    let lastVideoTime = -1

    // FLAG KRUSIAL: Mencegah Race Condition di React Strict Mode
    let isActive = true

    // Suppress MediaPipe/TF Lite WASM noise for entire component lifetime
    // (covers both init and per-frame detectForVideo calls)
    const NOISE_RE = /XNNPACK|TensorFlow Lite|Created delegate|Falling back|xnnpack/i
    const _origLog = console.log
    const _origError = console.error
    console.log = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && NOISE_RE.test(args[0])) return
      _origLog(...args)
    }
    console.error = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && NOISE_RE.test(args[0])) return
      _origError(...args)
    }

    const initializeMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        )

        const fl = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1,
        })

        // GUARD: Hentikan jika komponen sudah di-unmount
        if (!isActive) {
          fl.close()
          return
        }

        faceLandmarker = fl
        setIsModelLoaded(true)
        startCamera()
      } catch (error) {
        _origError('Error loading MediaPipe model:', error)
      }
    }

    const startCamera = async () => {
      if (!isActive || !navigator.mediaDevices?.getUserMedia) return
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        })
        if (videoRef.current && isActive) {
          videoRef.current.srcObject = stream
          videoRef.current.addEventListener('loadeddata', predictWebcam)
        }
      } catch (err) {
        console.error('Akses kamera ditolak atau tidak ditemukan.', err)
      }
    }

    const predictWebcam = () => {
      if (!isActive || !videoRef.current || !canvasRef.current || !faceLandmarker) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (video.readyState >= 2 && video.videoWidth > 0 && lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime
        const startTimeMs = performance.now()
        
        try {
          const results = faceLandmarker.detectForVideo(video, startTimeMs)

          if (ctx) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            if (results.faceLandmarks?.length) {
              const lm = results.faceLandmarks[0] as LandmarkPoint[]

              ctx.fillStyle = '#3b82f6'
              for (const point of lm) {
                ctx.beginPath()
                ctx.arc(point.x * canvas.width, point.y * canvas.height, 1.5, 0, 2 * Math.PI)
                ctx.fill()
              }

              const leftEAR = calcEAR(lm, LEFT_EYE)
              const rightEAR = calcEAR(lm, RIGHT_EYE)
              const avgEAR = (leftEAR + rightEAR) / 2
              const eyeOpenness = Math.min(1, Math.max(0, (avgEAR - 0.15) / 0.2))

              const gaze = gazeFromLandmarks(lm)
              const engagementScore = computeEngagement(avgEAR, gaze.direction)
              const focusLevel = focusFromEngagement(engagementScore)

              updateRef.current({
                focusLevel,
                engagementScore,
                gazeDirection: gaze.direction,
                gazeX: gaze.x,
                gazeY: gaze.y,
                eyeOpenness,
                lastUpdatedAt: Date.now(),
              })
            } else {
              updateRef.current({
                focusLevel: 'unknown',
                engagementScore: null,
                gazeDirection: 'unknown',
                eyeOpenness: null,
                lastUpdatedAt: Date.now(),
              })
            }
          }
        } catch (err) {
          console.warn("Skipped frame due to MediaPipe collision:", err)
        }
      }

      if (isActive) {
        animationFrameId = requestAnimationFrame(predictWebcam)
      }
    }

    initializeMediaPipe()

    return () => {
      isActive = false
      console.log = _origLog
      console.error = _origError
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      if (faceLandmarker) {
        try { faceLandmarker.close() } catch (_) { /* ignore */ }
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-900 overflow-hidden rounded-b-xl">
      {!isModelLoaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-100">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-600 font-medium text-sm animate-pulse">Memuat Visi AI...</p>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute w-full h-full object-cover opacity-60 transform scale-x-[-1]"
      />

      <canvas
        ref={canvasRef}
        className="absolute w-full h-full object-cover z-10 transform scale-x-[-1]"
      />
    </div>
  )
}