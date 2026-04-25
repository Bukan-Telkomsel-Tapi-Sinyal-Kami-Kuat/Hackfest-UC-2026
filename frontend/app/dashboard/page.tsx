import DashboardShell from "@/components/layout/DashboardShell";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <h1 style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: "0.5rem" }}>
        Dashboard
      </h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        SH-09 selesai — siap lanjut ke SH-10 (Webcam & MediaPipe).
      </p>
    </DashboardShell>
  );
}