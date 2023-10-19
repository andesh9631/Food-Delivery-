import React from "react";
import Delete from "@material-ui/icons/Delete";
import { useCart, useDispatchCart } from "../components/ContextReducer";
import { useHttpClient } from "../Hooks/http-hook";
import { toast } from "react-toastify";
export default function Cart() {
  let data = useCart();
  let dispatch = useDispatchCart();
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "top-right",
    });
  const handleError = (err) =>
    toast.error(err, {
      position: "top-right",
    });
  const { isLoading, error, sendRequest } = useHttpClient();
  let userEmail = localStorage.getItem("userEmail");
  const handleCheckOut = async () => {
    try {
      const responseData = await sendRequest(
        "http://localhost:2020/api/auth/fooddelivery/orderdata",
        "POST",
        JSON.stringify({ order_data: data, email: userEmail }),
        {
          "Content-Type": "application/json",
        }
      );
      const { success, message } = responseData;

      if (success) {
        dispatch({ type: "DROP" });
        handleSuccess(message);
      } else {
        handleError(message);
      }
    } catch (err) {
      handleError(error);
    }
  };
  if (data.length === 0) {
    return (
      <div>
        <div className="m-5 w-100 text-center fs-3">The Cart is Empty!</div>
      </div>
    );
  }
  let totalPrice = data.reduce((total, food) => total + food.price, 0);
  return (
    <div>
      {console.log(data)}
      <div className="container m-auto mt-5 table-responsive  table-responsive-sm table-responsive-md">
        <table className="table table-hover ">
          <thead className=" text-success fs-4">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Quantity</th>
              <th scope="col">Option</th>
              <th scope="col">Amount</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((food, index) => (
              <tr>
                <th scope="row">{index + 1}</th>
                <td>{food.name}</td>
                <td>{food.qty}</td>
                <td>{food.size}</td>
                <td>{food.price}</td>
                <td>
                  <button type="button" className="btn p-0">
                    <Delete
                      onClick={() => {
                        dispatch({ type: "REMOVE", index: index });
                      }}
                    />
                  </button>{" "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <h1 className="fs-2">Total Price: {totalPrice}/-</h1>
        </div>
        <div>
          <button className="btn bg-success mt-5 " onClick={handleCheckOut}>
            {" "}
            Check Out{" "}
          </button>
        </div>
      </div>
    </div>
  );
}
