"use client";

import { Card } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-700 mb-4">
            Your privacy is important to us. It is our policy to respect your
            privacy regarding any information we may collect from you across our
            website.
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Information We Collect
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            We only ask for personal information when we truly need it to
            provide a service to you. We collect it by fair and lawful means,
            with your knowledge and consent. We also let you know why we’re
            collecting it and how it will be used.
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Use of Information
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            We only retain collected information for as long as necessary to
            provide you with your requested service. What data we store, we’ll
            protect within commercially acceptable means to prevent loss and
            theft, as well as unauthorized access, disclosure, copying, use or
            modification.
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Distribution of Files
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            All files uploaded to our platform are the property of the uploader.
            Users are strictly prohibited from distributing, sharing, or
            reproducing any files from our platform without the express consent
            of the original uploader. Any unauthorized distribution of files is
            illegal and will be treated as a breach of our terms of service.
            We reserve the right to take legal action against any user found to
            be distributing files without permission.
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Security
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            The security of your personal information is important to us, but
            remember that no method of transmission over the Internet, or
            method of electronic storage, is 100% secure. While we strive to
            use commercially acceptable means to protect your personal
            information, we cannot guarantee its absolute security.
          </p>
        </Card>
      </div>
    </div>
  );
}
