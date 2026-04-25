// app/components/VisionTracker.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

export default function VisionTracker() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isModelLoaded, setIsModelLoaded] = useState(false)

  useEffect(() => {
    let faceLandmarker: FaceLandmarker
    let animationFrameId: number
    let lastVideoTime = -1 // Variabel krusial untuk melacak frame video

    const initializeMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        )
        
        faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1
        })
        
        setIsModelLoaded(true)
        startCamera()
      } catch (error) {
        console.error("Error loading MediaPipe model:", error)
      }
    }

    const startCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: 'user' }
          })
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.addEventListener('loadeddata', predictWebcam)
          }
        } catch (err) {
          console.error("Akses kamera ditolak atau tidak ditemukan.", err)
        }
      }
    }

    const predictWebcam = async () => {
      if (!videoRef.current || !canvasRef.current || !faceLandmarker) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      // Pastikan data video sudah cukup untuk di-render
      if (video.readyState >= 2) {
        const startTimeMs = performance.now()
        
        // PENCEGAHAN ERROR: Cek apakah frame video benar-benar sudah maju
        if (lastVideoTime !== video.currentTime) {
          lastVideoTime = video.currentTime
          
          // Sekarang aman untuk menjalankan deteksi
          const results = faceLandmarker.detectForVideo(video, startTimeMs)

          if (ctx) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            
            if (results.faceLandmarks) {
              ctx.fillStyle = '#3b82f6' 
              for (const landmarks of results.faceLandmarks) {
                for (const landmark of landmarks) {
                  ctx.beginPath()
                  ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 1.5, 0, 2 * Math.PI)
                  ctx.fill()
                }
              }
            }
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(predictWebcam)
    }

    initializeMediaPipe()

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      if (faceLandmarker) faceLandmarker.close()
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-900 overflow-hidden rounded-b-xl">
      {!isModelLoaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-100">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
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