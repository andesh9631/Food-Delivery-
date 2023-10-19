import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";
import { useHttpClient } from "../Hooks/http-hook";
import { toast } from "react-toastify";
export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  let navigate = useNavigate();
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "top-right",
    });
  const handleError = (err) =>
    toast.error(err, {
      position: "top-right",
    });
  const { isLoading, sendRequest } = useHttpClient();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await sendRequest(
        "http://localhost:2020/api/auth/fooddelivery/login",
        "POST",
        JSON.stringify({ ...credentials }),
        {
          "Content-Type": "application/json",
        }
      );
      // console.log(data)
      const { success, message, token } = data;
      console.log(data, "data");
      if (success) {
        handleSuccess(message);
        localStorage.setItem("userEmail", credentials.email);
        localStorage.setItem("token", token);
        navigate("/");
      } else {
        handleError(message);
      }
    } catch (err) {
      console.log(err.message);
      handleError(err);
    }
  };
  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div
      style={{
        backgroundImage:
          'url("https://images.pexels.com/photos/326278/pexels-photo-326278.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")',
        height: "100vh",
        backgroundSize: "cover",
      }}
    >
      <div>
        <Navbar />
      </div>
      <div className="container">
        <form
          className="w-50 m-auto mt-5 border bg-dark border-success rounded"
          onSubmit={handleSubmit}
        >
          <div className="m-3">
            <label htmlFor="exampleInputEmail1" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={credentials.email}
              onChange={onChange}
              aria-describedby="emailHelp"
            />
            <div id="emailHelp" className="form-text">
              We'll never share your email with anyone.
            </div>
          </div>
          <div className="m-3">
            <label htmlFor="exampleInputPassword1" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              value={credentials.password}
              onChange={onChange}
              name="password"
            />
          </div>
          <button type="submit" className="m-3 btn btn-success">
            Submit
          </button>
          <Link to="/signup" className="m-3 mx-1 btn btn-danger">
            New User
          </Link>
        </form>
      </div>
    </div>
  );
}

// , 'Accept': 'application/json',
//         'Access-Control-Allow-Origin': 'http://localhost:3000/login', 'Access-Control-Allow-Credentials': 'true',
//         "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE, OPTIONS'
