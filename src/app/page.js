"use client";
import { useState } from "react";
import { uploadImage } from "@/lib/cloudinary";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Home() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Please select an image first.");

    try {
      // 1. Upload to Cloudinary
      const imageUrl = await uploadImage(file);
      setUrl(imageUrl);

      // 2. Save the link to Firestore
      await addDoc(collection(db, "sample"), {
        imageUrl,
        createdAt: serverTimestamp(),
      });

      alert("✅ Image uploaded and saved to Firestore!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Failed to upload or save the image.");
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Upload to Firestore Sample</h1>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>

      {url && (
        <div>
          <p>Saved Image:</p>
          <img src={url} alt="Uploaded" width={200} />
        </div>
      )}
    </main>
  );
}
