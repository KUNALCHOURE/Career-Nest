import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      // 🔐 Replace this with your actual API call
      // await axios.post('/api/forgot-password', { email });
      setTimeout(() => {
        setMessage('A password reset link has been sent to your email.');
        setIsSubmitting(false);
      }, 1500);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Illustration Side */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 p-12">
          <div className="h-full flex flex-col justify-center items-center text-white">
            <h1 className="text-4xl font-bold mb-6">Reset Password</h1>
            <p className="text-lg text-indigo-100 mb-8 text-center">
              Forgot your password? Don't worry, we'll help you reset it!
            </p>
            <img
              src="https://illustrations.popsy.co/white/lock-password.svg"
              alt="Forget Password"
              className="w-full max-w-xs"
            />
          </div>
        </div>

        {/* Right Form Side */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Forgot your password?
            </h2>
            <p className="text-gray-600 text-center mb-6 text-sm">
              Enter your registered email and we’ll send you a password reset link.
            </p>

            {message && (
              <div className="bg-green-50 border-l-4 border-green-400 text-green-700 p-4 rounded mb-4 text-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.94 6.94a.75.75 0 011.06 0L10 12.94l5.94-6a.75.75 0 111.06 1.06l-6.5 6.5a.75.75 0 01-1.06 0l-6.5-6.5a.75.75 0 010-1.06z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="pl-10 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                    isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-[1.02]`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
                Remembered your password? Login instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
