import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

interface GoogleLoginButtonProps {
  onSuccess: (userInfo: any) => void;
  onError?: () => void;
}

export default function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  return (
    <GoogleLogin
      onSuccess={credentialResponse => {
        try {
          // Decode the ID token (contains user info)
          const decoded = jwtDecode(credentialResponse.credential as string);
          console.log('Google user:', decoded);

          // You can send the credential to your backend here for verification
          // fetch('/api/auth/google', { method: 'POST', body: JSON.stringify({ token: credentialResponse.credential }) })

          onSuccess(decoded); // or the full credentialResponse
        } catch (err) {
          console.error('Failed to decode token', err);
          onError?.();
        }
      }}
      onError={() => {
        console.log('Google Login Failed');
        onError?.();
      }}
      useOneTap={false}           // Set true if you want "One Tap" auto prompt
      theme="filled_blue"         // Options: outline, filled_blue, filled_black
      size="large"
      text="signin_with"          // "signin_with", "signup_with", "continue_with"
      shape="rectangular"
      logo_alignment="left"
    />
  );
}
