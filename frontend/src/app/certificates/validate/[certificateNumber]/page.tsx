'use client';

import { use } from 'react';
import CertificateValidation from '@/components/certificates/CertificateValidation';

interface PageProps {
  params: Promise<{ certificateNumber: string }>;
}

export default function ValidateCertificatePage({ params }: PageProps) {
  const resolvedParams = use(params);
  
  return <CertificateValidation certificateNumber={resolvedParams.certificateNumber} />;
}







