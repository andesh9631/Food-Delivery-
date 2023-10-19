import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { mapAction } from "../Store/map-slice";
export const IpLocationTracker = () => {
  // const { current: map } = useMap();
  const [errorMessage, setErrorMessage] = useState([]);
  const dispatch = useDispatch();
  const location = useSelector((state) => state.location.location);
  const mapRef = useRef();
  const newErrorDataHandler = (error) => {
    setErrorMessage({ ...errorMessage, message: error });
  };
  useEffect(() => {
    if (!location.latitude && !location.longitude) {
      fetch("https://ipapi.co/json/")
        .then((response) => {
          return response.json();
        })
        .catch((e) => {
          newErrorDataHandler(e.message);
        })
        .then((data) => {
          mapRef.current.flyTo({
            center: [data.longitude, data.latitude],
          });
          dispatch(
            mapAction.newPlace({
              latitude: data.latitude,
              longitude: data.longitude,
            })
          );
        })
        .catch((e) => {
          setErrorMessage(e.message);
        });
    }
  }, []);
  console.log(errorMessage);
  const clearError = () => {
    setErrorMessage([]);
  };
  const errorAndRender = () => {
    dispatch(mapAction.mapClose());
    setErrorMessage([]);
  };
  return {
    error: errorMessage,
    clearError,
    errorAndRender,
  };
};
