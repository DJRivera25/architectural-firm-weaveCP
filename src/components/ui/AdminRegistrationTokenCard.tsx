import { useState } from "react";
import { generateRegistrationToken } from "@/utils/api";
import { Button } from "@/components/ui/Button";

export default function AdminRegistrationTokenCard() {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await generateRegistrationToken();
      setToken(res.data.token);
      setExpiresAt(new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString());
      setSuccess(true);
    } catch (err: unknown) {
      setError("Failed to generate token. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-lg mx-auto mt-4 shadow">
      <h2 className="text-xl font-bold text-blue-800 mb-2">Generate Registration Token</h2>
      <p className="text-gray-700 mb-4">
        Generate a one-time registration token for new user onboarding. Token is valid for 30 minutes and can only be
        used once.
      </p>
      <Button onClick={handleGenerate} disabled={loading} className="mb-4">
        {loading ? "Generating..." : "Generate Token"}
      </Button>
      {token && (
        <div className="mt-4">
          <div className="font-semibold text-gray-800">Token:</div>
          <div className="text-2xl font-mono bg-white border border-blue-200 rounded px-4 py-2 my-2 select-all text-blue-700 tracking-widest">
            {token}
          </div>
          <div className="text-sm text-gray-600">
            Expires at: <span className="font-semibold">{expiresAt}</span>
          </div>
        </div>
      )}
      {success && <div className="text-green-700 mt-2">Token generated successfully!</div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}
