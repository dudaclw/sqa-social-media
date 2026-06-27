"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Input from "@/components/Input";
import Button from "@/components/Button";
import TextButton from "@/components/TextButton";
import { authService } from "@/service/auth/auth";
import { isEmailValid, getEmailValidationMessage } from "@/utils/email";
import { AxiosError } from "axios";

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function validateForm(): boolean {
    if (!email) {
      setEmailError("Email é obrigatório");
      return false;
    } else if (!isEmailValid(email)) {
      setEmailError(getEmailValidationMessage(email));
      return false;
    } else {
      setEmailError("");
      return true;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({ email });
      setSuccessMessage("E-mail enviado com sucesso");

      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.message ||
            "Erro ao enviar email. Verifique se o email está cadastrado."
        );
      } else {
        setError("Erro ao enviar email. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      <Header />

      <main
        style={{
          maxWidth: "400px",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: "0.5rem",
            padding: "2rem",
            marginTop: "2rem",
          }}
        >
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: "bold",
              marginBottom: "1.5rem",
              textAlign: "center",
              color: "var(--foreground)",
            }}
          >
            Resetar Senha
          </h1>

          {error && (
            <div
              style={{
                background: "var(--error)",
                color: "white",
                padding: "0.75rem",
                borderRadius: "0.375rem",
                marginBottom: "1rem",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          {successMessage && (
            <div
              style={{
                background: "var(--success)",
                color: "white",
                padding: "0.75rem",
                borderRadius: "0.375rem",
                marginBottom: "1rem",
                fontSize: "0.875rem",
              }}
            >
              {successMessage}
            </div>
          )}

          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--foreground)",
              opacity: 0.8,
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            Digite seu email para receber as instruções de recuperação de senha.
          </p>

          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              placeholder="seu@email.com"
            />

            <Button
              type="submit"
              isLoading={isLoading}
              style={{ width: "100%", marginTop: "1rem" }}
            >
              Enviar Email
            </Button>
          </form>

          <div
            style={{
              marginTop: "1.5rem",
              textAlign: "center",
              fontSize: "0.875rem",
              color: "var(--foreground)",
              opacity: 0.8,
            }}
          >
            Lembrou sua senha?{" "}
            <TextButton onClick={() => router.push("/signin")}>
              Entrar
            </TextButton>
          </div>
        </div>
      </main>
    </div>
  );
}
