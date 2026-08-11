import { toast } from 'sonner';

// Utility component/functions for credential notifications
export const showSaveSuccess = () => {
  toast.success('✓ Kle a sove avèk siksè', {
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  });
};

export const showSaveError = (message) => {
  toast.error(`✗ Erè pandan y ap sove kle a: ${message || ''}`, {
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  });
};

export const showTestSuccess = () => {
  toast.success('✓ Koneksyon teste avèk siksè', {
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  });
};

export const showTestError = () => {
  toast.error('✗ Koneksyon echwe', {
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  });
};

// Dummy component to satisfy the requirement of a .jsx file if imported as a component
const CredentialNotifications = () => {
  return null;
};

export default CredentialNotifications;