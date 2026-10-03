import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { GithubIcon, GoogleIcon } from "../components/BrandIcons";

const Auth = ({ mode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useShop();
  const isLogin = mode === "login";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");

  const redirectTo = location.state?.from || "/account/orders";

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email: form.email.trim(), name: form.name.trim() });
    navigate(redirectTo, { replace: true });
  };

  const social = (provider) => setNotice(`${provider} sign-in is not connected yet.`);

  return (
    <div className="page-container flex justify-center pt-5 sm:pt-10">
      <div className="w-full max-w-[420px] rounded-2xl border border-line bg-surface px-[18px] pt-1 pb-[22px] sm:px-7 sm:pt-2 sm:pb-7 [&>h1]:text-center [&>h1]:text-[22px] [&>h1]:font-bold [&>p]:mt-1 [&>p]:mb-5 [&>p]:text-center">
        <div
          className="no-scrollbar flex gap-6 overflow-x-auto border-b border-line [&>*]:-mb-px [&>*]:shrink-0 [&>*]:cursor-pointer [&>*]:border-b-2 [&>*]:border-transparent [&>*]:py-3.5 [&>*]:font-medium [&>*]:whitespace-nowrap [&>*]:text-muted [&>.active]:border-primary [&>.active]:text-primary mb-6 justify-center gap-0 [&>*]:flex-1 [&>*]:text-center"
          role="tablist"
        >
          <Link to="/login" role="tab" aria-selected={isLogin} className={isLogin ? "active" : ""}>
            Login
          </Link>
          <Link to="/register" role="tab" aria-selected={!isLogin} className={!isLogin ? "active" : ""}>
            Register
          </Link>
        </div>

        <h1>{isLogin ? "Welcome Back" : "Create Account"}</h1>
        <p className="text-muted">{isLogin ? "Login to your account" : "Join Teams24 for faster checkout"}</p>

        {notice && <div className="mb-3.5 rounded-lg bg-primary-soft px-3.5 py-2.5 text-ink">{notice}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="field">
              <label htmlFor="auth-name">Full name</label>
              <div className="relative [&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:top-1/2 [&>svg]:left-3 [&>svg]:-translate-y-1/2 [&>svg]:text-muted [&>.input]:pr-[38px] [&>.input]:pl-9">
                <User size={16} />
                <input
                  id="auth-name"
                  className="input"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}
          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <div className="relative [&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:top-1/2 [&>svg]:left-3 [&>svg]:-translate-y-1/2 [&>svg]:text-muted [&>.input]:pr-[38px] [&>.input]:pl-9">
              <Mail size={16} />
              <input
                id="auth-email"
                className="input"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="auth-password">Password</label>
            <div className="relative [&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:top-1/2 [&>svg]:left-3 [&>svg]:-translate-y-1/2 [&>svg]:text-muted [&>.input]:pr-[38px] [&>.input]:pl-9">
              <Lock size={16} />
              <input
                id="auth-password"
                className="input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={isLogin ? "Enter your password" : "At least 8 characters"}
                minLength={isLogin ? undefined : 8}
                value={form.password}
                onChange={handleChange}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
              />
              <button
                type="button"
                className="absolute top-1/2 right-2 grid -translate-y-1/2 cursor-pointer place-items-center p-1 text-muted"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {isLogin && (
            <div className="-mt-1 mb-4 flex justify-end text-[13px]">
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1 font-medium text-primary hover:text-primary-hover hover:underline"
                onClick={() => setNotice("Password reset is not connected yet.")}
              >
                Forgot Password?
              </button>
            </div>
          )}
          <button type="submit" className="btn btn-primary w-full p-3">
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <div className="mt-5 mb-3.5 flex items-center gap-3 text-xs text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
          or continue with
        </div>
        <div className="flex flex-col gap-2.5">
          <button type="button" className="btn btn-outline w-full" onClick={() => social("Google")}>
            <GoogleIcon /> Continue with Google
          </button>
          <button type="button" className="btn btn-outline w-full" onClick={() => social("GitHub")}>
            <GithubIcon /> Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
