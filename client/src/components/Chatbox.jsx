import { useEffect, useRef, useState } from "react";

const Chatbox = ({
  socket,
  currentUser,
  receiverId,
  receiverName,
  oldMessages,
}) => {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState(
    oldMessages || []
  );

  const bottomRef = useRef();

  useEffect(() => {
    setMessages(oldMessages);
  }, [oldMessages]);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const data = {
      senderId: currentUser._id,
      senderName: currentUser.name,
      senderRole: currentUser.role,

      receiverId,

      message,
    };

    socket.emit("sendMessage", data);

    setMessage("");
  };

  return (
    <div className="glass-card rounded-2xl shadow-lg p-5">
      <h2 className="text-2xl font-bold mb-5">
        Chat with {receiverName}
      </h2>

      <div className="h-[500px] overflow-y-auto border rounded-lg p-4 bg-black/40">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 flex ${msg.senderId === currentUser._id
                ? "justify-end"
                : "justify-start"
              }`}
          >
            <div
              className={`px-4 py-3 rounded-2xl max-w-[70%] ${msg.senderId === currentUser._id
                  ? "bg-primary text-white"
                  : "bg-white/10 border border-white/20 text-white"
                }`}
            >
              <p className="text-sm font-bold mb-1">
                {msg.senderName}
              </p>

              <p>{msg.message}</p>
            </div>
          </div>
        ))}

        <div ref={bottomRef}></div>
      </div>

      <div className="flex gap-3 mt-5">
        <input
          type="text"
          placeholder="Type message..."
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          className="flex-1 border border-white/20 bg-black/60 text-white placeholder-gray-400 p-3 rounded-lg outline-none focus:ring-2 focus:ring-primary"
        />

        <button
          onClick={sendMessage}
          className="bg-primary text-white px-6 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbox;