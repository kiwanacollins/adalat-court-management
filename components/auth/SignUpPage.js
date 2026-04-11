import { signin } from 'next-auth/client';
import { useRef, useState } from 'react';

import toast from 'react-hot-toast';

async function createUser(email, password, firstName, lastName, role) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, firstName, lastName, role }),
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

function SignUpPage(props) {
  const [isInvalid, setIsInvalid] = useState(false);

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const fnameInputRef = useRef(null);
  const lnameInputRef = useRef(null);
  const roleRef = useRef(null);

  async function submitHandler(e) {
    e.preventDefault();
    const toastId = toast.loading('Processing...');

    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;
    const enteredFirstName = fnameInputRef.current.value;
    const enteredLastName = lnameInputRef.current.value;
    const selectedRole = roleRef.current.value;

    if (
      !enteredEmail ||
      enteredEmail.trim() === '' ||
      !enteredEmail.includes('@') ||
      !enteredPassword ||
      enteredPassword.trim().length < 7 ||
      !enteredFirstName ||
      enteredFirstName.trim() === '' ||
      !enteredLastName ||
      enteredLastName.trim() === ''
    ) {
      setIsInvalid(true);
      toast.dismiss(toastId);
      toast.error('Please enter valid information. Password must be 7+ chars.');
      return;
    }

    setIsInvalid(false);

    try {
      const response = await createUser(
        enteredEmail,
        enteredPassword,
        enteredFirstName,
        enteredLastName,
        selectedRole
      );
      console.log(response);
      toast.dismiss(toastId);
      toast.success("Account created! Please log in.");

      emailInputRef.current.value = '';
      fnameInputRef.current.value = '';
      lnameInputRef.current.value = '';
      passwordInputRef.current.value = '';

      if (props.onAccountCreated) {
        props.onAccountCreated();
      }
    } catch (error) {
      console.log(error);
      toast.dismiss(toastId);
      toast.error(error.message || 'Account creation failed');
    }
  }

  return (
    <section className="w-full bg-white">
      <form onSubmit={submitHandler}>
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center">
            <div className="w-full bg-white lg:w-6/12 xl:w-5/12">
              <div className="flex flex-col items-start justify-start w-full h-full p-10 lg:p-16 xl:p-24">
                <h4 className="w-full text-3xl font-bold">Create Account</h4>
                <div className="relative w-full mt-10 space-y-8">
                  <div className="relative">
                    <label className="font-medium text-gray-900">First Name</label>
                    <input
                      ref={fnameInputRef}
                      type="text"
                      className="block w-full px-4 py-4 mt-2 text-xl placeholder-gray-400 bg-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-opacity-50"
                      placeholder="First Name"
                    />
                  </div>
                  <div className="relative">
                    <label className="font-medium text-gray-900">Last Name</label>
                    <input
                      ref={lnameInputRef}
                      type="text"
                      className="block w-full px-4 py-4 mt-2 text-xl placeholder-gray-400 bg-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-opacity-50"
                      placeholder="Last Name"
                    />
                  </div>
                  <div className="relative">
                    <label className="font-medium text-gray-900">Email</label>
                    <input
                      ref={emailInputRef}
                      type="text"
                      className="block w-full px-4 py-4 mt-2 text-xl placeholder-gray-400 bg-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-opacity-50"
                      placeholder="Email Address"
                    />
                  </div>
                  <div className="relative">
                    <label className="font-medium text-gray-900">Password</label>
                    <input
                      ref={passwordInputRef}
                      type="password"
                      className="block w-full px-4 py-4 mt-2 text-xl placeholder-gray-400 bg-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-opacity-50"
                      placeholder="Password (min. 7 characters)"
                    />
                  </div>
                  <div className="relative">
                    <label className="font-medium text-gray-900">Role</label>
                    <select
                      ref={roleRef}
                      defaultValue="litigant"
                      className="block w-full px-4 py-4 mt-2 text-xl bg-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-opacity-50"
                    >
                      <option value="litigant">Litigant (Party in a Case)</option>
                      <option value="clerk">Court Clerk / Registrar</option>
                      <option value="magistrate">Magistrate / Judicial Officer</option>
                    </select>
                  </div>
                  <div className="relative">
                    <button
                      type="submit"
                      className="inline-block w-full px-5 py-4 text-lg font-medium text-center text-white transition duration-200 bg-blue-700 rounded-lg hover:bg-blue-800 ease"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {isInvalid && <p className="text-red-500 text-center">Please enter valid information!</p>}

      <div className="flex items-center justify-center">
        <div className="relative w-full lg:w-6/12 xl:w-5/12 px-10 lg:px-16 xl:px-24 pb-10">
          <button
            onClick={signin}
            className="inline-block w-full px-5 py-4 mt-3 text-lg font-bold text-center text-gray-900 transition duration-200 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 ease"
          >
            Sign up with Google
          </button>
        </div>
      </div>
    </section>
  );
}

export default SignUpPage;
