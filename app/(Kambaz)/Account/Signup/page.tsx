"use client";

import { useState, ChangeEvent } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { FormControl } from "react-bootstrap";
import Link from "next/link";
import { setCurrentUser } from "../reducer";
import * as client from "../client";

type Role = "FACULTY" | "STUDENT";

type SignupForm = {
  username: string;
  password: string;
  verify: string;
  firstName: string;
  lastName: string;
  role: Role;
};

export default function Signup() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [form, setForm] = useState<SignupForm>({
    username: "",
    password: "",
    verify: "",
    firstName: "",
    lastName: "",
    role: "STUDENT",
  });

  const [error, setError] = useState<string | null>(null);

  const onInput =
    (k: keyof SignupForm) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
    };

  const onSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    setForm((f) => ({ ...f, role: e.target.value as Role }));
  };

  const signup = async () => {
    setError(null);

    if (!form.username || !form.password || form.password !== form.verify) {
      setError("Please fill all fields and make sure passwords match.");
      return;
    }

    const { verify, ...userForServer } = form;

    try {
      const user = await client.signup(userForServer);
      if (!user) {
        setError("Invalid signup response.");
        return;
      }
      dispatch(setCurrentUser(user));
      router.replace("/Account/Profile");
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } };
        setError(err.response?.data?.message ?? "Unable to sign up.");
      }
  };

  return (
    <div id="wd-signup-screen" style={{ maxWidth: 520 }}>
      <h1 className="h3 mb-3">Sign up</h1>

      {error && (
        <div className="alert alert-danger mb-2" id="wd-signup-error">
          {error}
        </div>
      )}

      <FormControl
        id="wd-signup-username"
        placeholder="username"
        className="mb-2"
        value={form.username}
        onChange={onInput("username")}
      />
      <FormControl
        id="wd-signup-password"
        placeholder="password"
        type="password"
        className="mb-2"
        value={form.password}
        onChange={onInput("password")}
      />
      <FormControl
        id="wd-signup-verify-password"
        placeholder="verify password"
        type="password"
        className="mb-2"
        value={form.verify}
        onChange={onInput("verify")}
      />
      <FormControl
        placeholder="first name"
        className="mb-2"
        value={form.firstName}
        onChange={onInput("firstName")}
      />
      <FormControl
        placeholder="last name"
        className="mb-3"
        value={form.lastName}
        onChange={onInput("lastName")}
      />

      <select
        id="wd-role"
        className="form-select mb-3"
        value={form.role}
        onChange={onSelect}
      >
        <option value="FACULTY">Faculty</option>
        <option value="STUDENT">Student</option>
      </select>

      <button
        id="wd-signup-btn"
        className="btn btn-primary w-100"
        onClick={signup}
      >
        Signup
      </button>

      <div className="mt-3 text-end">
        <Link href="/Account/Signin">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
