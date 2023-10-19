import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useHttpClient } from "../Hooks/http-hook";
import { toast } from "react-toastify";
export default function Signup() {
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    geolocation: "",
    mobilenumber: "",
  });
  let [address, setAddress] = useState("");
  let navigate = useNavigate();

  const { isLoading: locationLoading, sendRequest: locationSendRequest } =
    useHttpClient();
  const { isLoading, sendRequest } = useHttpClient();
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "top-right",
    });
  const handleError = (err) =>
    toast.error(err, {
      position: "top-right",
    });
  const handleClick = async (e) => {
    e.preventDefault();

    try {
      let navLocation = () => {
        return new Promise((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej);
        });
      };
      let latlong = await navLocation().then((res) => {
        let latitude = res.coords.latitude;
        let longitude = res.coords.longitude;
        return [latitude, longitude];
      });
      let [lat, long] = latlong;
      const data = await locationSendRequest(
        "http://localhost:2020/api/auth/fooddelivery/location",
        "POST",
        JSON.stringify({ lat, long }),
        {
          "Content-Type": "application/json",
        }
      );
      const { success, location, message } = data;
      console.log(data, "data");
      if (success) {
        setAddress(location);
      } else {
        handleError(message);
      }
    } catch (err) {
      console.log(err.message);
      handleError(err);
    }

    setCredentials({ ...credentials, [e.target.name]:address  });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await sendRequest(
        "http://localhost:2020/api/auth/fooddelivery/Register",
        "POST",
        JSON.stringify({ ...credentials }),
        {
          "Content-Type": "application/json",
        }
      );
      const { success, message, token } = data;
      console.log(data, "data");
      if (success) {
        handleSuccess(message);
        localStorage.setItem("token", token);
        localStorage.setItem("userEmail", credentials.email);
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
          'url("https://images.pexels.com/photos/1565982/pexels-photo-1565982.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")',
        backgroundSize: "cover",
        height: "100vh",
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
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={credentials.name}
              onChange={onChange}
              aria-describedby="emailHelp"
            />
          </div>
          <div className="m-3">
            <label htmlFor="email" className="form-label">
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
          </div>
          <div className="m-3">
            <label htmlFor="mobilenumber" className="form-label">
              Mobile Number
            </label>
            <input
              type="mobilenumber"
              className="form-control"
              name="mobilenumber"
              value={credentials.mobilenumber}
              onChange={onChange}
              aria-describedby="emailHelp"
            />
          </div>
          <div className="m-3">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <fieldset>
              <input
                type="text"
                className="form-control"
                name="address"
                placeholder='"Click below for fetching address"'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                aria-describedby="emailHelp"
              />
            </fieldset>
          </div>
          <div className="m-3">
            <button
              type="button"
              onClick={handleClick}
              name="geolocation"
              className=" btn btn-success"
            >
              Click for current Location{" "}
            </button>
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
          <Link to="/login" className="m-3 mx-1 btn btn-danger">
            Already a user
          </Link>
        </form>
      </div>
    </div>
  );
}
