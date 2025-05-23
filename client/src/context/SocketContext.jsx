import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import apiRequest from "../lib/apiRequest.js";

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [receiverList, setReceiverList] = useState([]);
  useEffect(() => {
    setSocket(io(process.env.VITE_BACKEND_URI));
  }, []);

  useEffect(() => {

    if (currentUser) {
      const getReceivers = async () => {
        try {
          const res = await apiRequest.get("/users/getReceiverList");
          const receiverList = res.data;
          setReceiverList(receiverList); // 업데이트
        } catch (err) {
          console.log(err);
        }
      };

      getReceivers();
    }else{
      console.log('로그아웃');
    }
  }, [currentUser]);

  useEffect(() => {
    if(socket && currentUser && receiverList.length > 0) { //로그인하면
      socket?.emit("newUser", currentUser.id, receiverList); //접속자 아이디, 접속자가 들어있는 채팅방 친구들 모두 가져온다.
    }

  }, [currentUser, socket, receiverList]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
