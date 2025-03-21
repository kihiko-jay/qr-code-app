import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GenerateQR = () => {
  const [data, setData] = useState("");
  const [color, setColor] = useState("#000000");
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("data", data);
    formData.append("color", color);
    if (logo) formData.append("logo", logo);

    try {
      await axios.post("/api/qrcodes/generate", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("QR code generated successfully!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError("Failed to generate QR code. Please try again.");
      console.error("Error generating QR code:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      setError("Only image files are allowed!");
      setLogo(null);
      return;
    }
    setError("");
    setLogo(file);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Generate QR Code</h1>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter URL or text"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <div className="flex items-center gap-4">
          <label>Color:</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-16 h-10" />
        </div>

        <input type="file" accept="image/*" onChange={handleFileChange} className="block" />

        <button
          type="submit"
          className={`bg-blue-500 text-white px-4 py-2 rounded ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </form>
    </div>
  );
};

export default GenerateQR;