import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DrawingCanvas from "../components/DrawingCanvas";

export default function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-600">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <DrawingCanvas/>
        </div>
      </main>
    </>
  );
}
