import { useState } from "react";
import type { User } from "@/types";
import AuthAnimated from "./AuthAnimated";
import { useLang } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { resolveWorkcaUser } from "../utils/authProfile";

interface AuthPageProps {
  initialMode?: "login" | "register";
  onLogin?: (user: User) => void | Promise<void>;
}

export default function AuthPage({ initialMode = "login", onLogin }: AuthPageProps = {}) {
  const { lang } = useLang();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");

  const handleLogin = async (values: { email: string; password: string }) => {
    setError("");
    setNotice("");
    if (!supabase) {
      setError(lang === "fr" ? "Le service de connexion est indisponible. Réessayez plus tard." : "Sign-in is unavailable. Please try again later.");
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });
      if (authError) throw authError;
      if (!data.user) throw new Error(lang === "fr" ? "Compte introuvable." : "Account not found.");

      const user = await resolveWorkcaUser(data.user);
      if (user.status === "suspendu") {
        await supabase.auth.signOut();
        throw new Error(lang === "fr" ? "Ce compte est suspendu. Contactez l'assistance Workca." : "This account is suspended. Contact Workca support.");
      }
      await onLogin?.(user);
    } catch (loginError) {
      if (
        loginError instanceof Error
        && "code" in loginError
        && loginError.code === "email_not_confirmed"
      ) {
        setVerificationEmail(values.email.trim().toLowerCase());
        setNotice(lang === "fr"
          ? "Cette adresse n'est pas encore confirmée. Saisissez le code reçu par email ou demandez-en un nouveau."
          : "This email is not confirmed yet. Enter the code sent by email or request a new one.");
        return;
      }
      setError(loginError instanceof Error
        ? loginError.message
        : lang === "fr" ? "Connexion impossible. Vérifiez vos identifiants et réessayez." : "Could not sign in. Check your credentials and try again.");
    }
  };

  const handleRegister = async (values: { username: string; email: string; password: string; role?: "chercheur" | "employeur" }) => {
    setError("");
    setNotice("");
    const username = values.username.trim();
    const email = values.email.trim().toLowerCase();
    if (!username || !email || !values.password) {
      setError(lang === "fr" ? "Indiquez votre nom, votre email et un mot de passe." : "Enter your name, email, and a password.");
      return;
    }
    if (!supabase) {
      setError(lang === "fr" ? "Le service d'inscription est indisponible. Réessayez plus tard." : "Sign-up is unavailable. Please try again later.");
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password: values.password,
        options: {
          data: { name: username, role: values.role ?? "chercheur" },
        },
      });
      if (authError) throw authError;
      if (!data.user) throw new Error(lang === "fr" ? "Le compte n'a pas pu être créé." : "The account could not be created.");
      if (!data.session) {
        setVerificationEmail(email);
        setNotice(lang === "fr"
          ? `Compte créé. Saisissez le code de vérification envoyé à ${email}.`
          : `Account created. Enter the verification code sent to ${email}.`);
        return;
      }

      const user = await resolveWorkcaUser(data.user);
      await onLogin?.(user);
    } catch (registrationError) {
      setError(registrationError instanceof Error
        ? registrationError.message
        : lang === "fr" ? "Inscription impossible. Vérifiez les informations et réessayez." : "Could not sign up. Check the information and try again.");
    }
  };

  const handleVerifyEmail = async (token: string) => {
    setError("");
    setNotice("");
    if (!supabase || !verificationEmail) {
      setError(lang === "fr" ? "La vérification est indisponible. Réessayez plus tard." : "Verification is unavailable. Please try again later.");
      return;
    }
    if (!/^\d{6}$/.test(token.trim())) {
      setError(lang === "fr" ? "Saisissez le code à 6 chiffres reçu par email." : "Enter the 6-digit code sent by email.");
      return;
    }

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: verificationEmail,
        token: token.trim(),
        type: "signup",
      });
      if (verifyError) throw verifyError;
      if (!data.user) throw new Error(lang === "fr" ? "La vérification n'a pas abouti. Demandez un nouveau code." : "Verification failed. Request a new code.");
      const user = await resolveWorkcaUser(data.user);
      if (user.status === "suspendu") {
        await supabase.auth.signOut();
        throw new Error(lang === "fr" ? "Ce compte est suspendu. Contactez l'assistance Workca." : "This account is suspended. Contact Workca support.");
      }
      setVerificationEmail("");
      await onLogin?.(user);
    } catch (verificationError) {
      setError(verificationError instanceof Error
        ? verificationError.message
        : lang === "fr" ? "Code invalide ou expiré. Vérifiez-le et réessayez." : "Invalid or expired code. Check it and try again.");
    }
  };

  const handleResendConfirmation = async () => {
    setError("");
    setNotice("");
    if (!supabase || !verificationEmail) {
      setError(lang === "fr" ? "Impossible d'envoyer un nouveau code pour le moment." : "Could not send a new code right now.");
      return;
    }
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: verificationEmail,
      });
      if (resendError) throw resendError;
      setNotice(lang === "fr" ? `Un nouveau code a été envoyé à ${verificationEmail}.` : `A new code was sent to ${verificationEmail}.`);
    } catch (resendError) {
      setError(resendError instanceof Error
        ? resendError.message
        : lang === "fr" ? "Impossible d'envoyer un nouveau code. Réessayez." : "Could not send a new code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AuthAnimated
        initialMode={initialMode}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onVerifyEmail={handleVerifyEmail}
        onResendConfirmation={handleResendConfirmation}
        onCancelVerification={() => {
          setVerificationEmail("");
          setError("");
          setNotice("");
        }}
        verificationEmail={verificationEmail}
        error={error}
        notice={notice}
      />
    </div>
  );
}
