import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSearchParams, Link } from "react-router-dom";
import socket from "../socket";
import { API_BASE_URL } from "../config/apiConfig";
import {
  FaSearch,
  FaPaperPlane,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaShieldAlt,
  FaCircle,
  FaCheckDouble,
  FaArrowLeft,
  FaComments,
  FaCommentDots
} from "react-icons/fa";

const Chatpage = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const [searchParams] = useSearchParams();
  const preselectedUserId = searchParams.get("userId") || searchParams.get("teacherId");

  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const activeContactRef = useRef(activeContact);

  // Keep activeContactRef synced with state
  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  // Auto-scroll to bottom of messages window
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch contact list
  const fetchContacts = async () => {
    try {
      setLoadingContacts(true);
      const res = await axios.get(`${API_BASE_URL}/api/messages/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(res.data);

      // If preselected user is passed in URL query param, pick that contact
      if (preselectedUserId) {
        const found = res.data.find((c) => c._id === preselectedUserId);
        if (found) {
          setActiveContact(found);
          setShowMobileSidebar(false);
        } else if (res.data.length > 0) {
          setActiveContact(res.data[0]);
        }
      } else if (res.data.length > 0 && !activeContactRef.current) {
        setActiveContact(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to load contacts:", err);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Fetch message history for active contact
  const fetchMessages = async (contactId) => {
    if (!contactId || !currentUser) return;
    try {
      setLoadingMessages(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/messages/${currentUser._id}/${contactId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Initial load and socket listeners setup
  useEffect(() => {
    if (!currentUser) return;

    // Register user with socket server
    socket.emit("join", currentUser._id);

    // Listen to online users list
    socket.on("onlineUsers", (userList) => {
      setOnlineUsers(userList);
    });

    // Listen to incoming real-time messages
    socket.on("receiveMessage", (newMsg) => {
      const currentActive = activeContactRef.current;

      // STRICT CONVERSATION FILTER: Only append message to current active chat window!
      if (
        currentActive &&
        (newMsg.senderId === currentActive._id || newMsg.receiverId === currentActive._id)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
      }

      // Update last message in contact list preview
      setContacts((prevContacts) =>
        prevContacts.map((c) => {
          if (c._id === newMsg.senderId || c._id === newMsg.receiverId) {
            return {
              ...c,
              lastMessage: newMsg.message,
              lastMessageTime: newMsg.createdAt,
            };
          }
          return c;
        })
      );
    });

    // Listen to typing indicator
    socket.on("userTyping", ({ senderId }) => {
      const currentActive = activeContactRef.current;
      if (currentActive && senderId === currentActive._id) {
        setIsTyping(true);
      }
    });

    socket.on("userStopTyping", ({ senderId }) => {
      const currentActive = activeContactRef.current;
      if (currentActive && senderId === currentActive._id) {
        setIsTyping(false);
      }
    });

    fetchContacts();

    return () => {
      socket.off("onlineUsers");
      socket.off("receiveMessage");
      socket.off("userTyping");
      socket.off("userStopTyping");
    };
  }, []);

  // Fetch messages when active contact changes
  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact._id);
      setIsTyping(false);
    }
  }, [activeContact]);

  // Scroll to bottom on message list change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="glass-card p-10 rounded-3xl shadow-2xl text-center max-w-md w-full border border-cyan-500/30">
          <FaComments className="text-5xl text-cyan-400 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-white mb-2">WhatsApp Chat Authentication</h2>
          <p className="text-slate-300 text-sm mb-6">
            Please log in to communicate with teachers, students, and classmates in real-time.
          </p>
          <Link
            to="/login"
            className="btn-primary w-full py-3 rounded-xl font-bold block shadow-[0_0_15px_rgba(56,189,248,0.4)]"
          >
            Log In to Chat
          </Link>
        </div>
      </div>
    );
  }

  // Handle typing status broadcast
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    if (!activeContact) return;

    socket.emit("typing", {
      senderId: currentUser._id,
      receiverId: activeContact._id,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: currentUser._id,
        receiverId: activeContact._id,
      });
    }, 1500);
  };

  // Send WhatsApp message
  const sendMessage = (e) => {
    e?.preventDefault();
    if (!messageInput.trim() || !activeContact) return;

    const data = {
      senderId: currentUser._id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId: activeContact._id,
      message: messageInput.trim(),
    };

    socket.emit("sendMessage", data);

    socket.emit("stopTyping", {
      senderId: currentUser._id,
      receiverId: activeContact._id,
    });

    setMessageInput("");
  };

  // Filter contact list
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      filterRole === "all" ||
      (filterRole === "instructor" && (c.role === "instructor" || c.role === "teacher")) ||
      (filterRole === "student" && c.role === "student") ||
      (filterRole === "admin" && c.role === "admin");

    return matchesSearch && matchesRole;
  });

  // Get user role badge formatting
  const getRoleBadge = (role) => {
    if (role === "instructor" || role === "teacher") {
      return (
        <span className="text-[10px] bg-purple-950 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
          <FaChalkboardTeacher /> Teacher
        </span>
      );
    }
    if (role === "admin") {
      return (
        <span className="text-[10px] bg-amber-950 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
          <FaShieldAlt /> Admin
        </span>
      );
    }
    return (
      <span className="text-[10px] bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
        <FaUserGraduate /> Student
      </span>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-8 px-2 md:px-6 max-w-7xl mx-auto flex flex-col">
      
      {/* Main WhatsApp Window Container */}
      <div className="glass-card rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col md:flex-row h-[calc(100vh-120px)] min-h-[550px] relative">
        
        {/* LEFT SIDEBAR: CONTACTS LIST */}
        <div
          className={`${
            showMobileSidebar ? "flex" : "hidden"
          } md:flex flex-col w-full md:w-80 lg:w-96 bg-slate-950/90 border-r border-white/10 shrink-0 h-full`}
        >
          {/* Current User Header */}
          <div className="p-4 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md">
                  {currentUser.name?.charAt(0).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm line-clamp-1">{currentUser.name}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  {getRoleBadge(currentUser.role)}
                </div>
              </div>
            </div>

            <div className="text-cyan-400 font-bold text-xs bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-500/30">
              Live Chat
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 bg-slate-950/80 border-b border-white/10">
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-3 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search teacher, student, or admin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 mt-2">
              <button
                onClick={() => setFilterRole("all")}
                className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  filterRole === "all"
                    ? "bg-cyan-500 text-black shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterRole("instructor")}
                className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  filterRole === "instructor"
                    ? "bg-purple-500 text-white shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                Teachers
              </button>
              <button
                onClick={() => setFilterRole("student")}
                className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  filterRole === "student"
                    ? "bg-sky-500 text-white shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setFilterRole("admin")}
                className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  filterRole === "admin"
                    ? "bg-amber-500 text-black shadow-sm font-bold"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                Admins
              </button>
            </div>
          </div>

          {/* Contacts List Scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {loadingContacts ? (
              <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                Loading chat contacts...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No users found.
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isOnline = onlineUsers.includes(contact._id);
                const isSelected = activeContact?._id === contact._id;

                return (
                  <div
                    key={contact._id}
                    onClick={() => {
                      setActiveContact(contact);
                      setShowMobileSidebar(false);
                    }}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-cyan-950/60 border-l-4 border-cyan-400 shadow-[inset_0_0_15px_rgba(56,189,248,0.15)]"
                        : "hover:bg-white/5"
                    }`}
                  >
                    {/* User Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                        {contact.name?.charAt(0).toUpperCase()}
                      </div>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse"></span>
                      )}
                    </div>

                    {/* Contact Info & Last Message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="font-bold text-white text-sm truncate">{contact.name}</h4>
                        {contact.lastMessageTime && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(contact.lastMessageTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-400 truncate">
                          {contact.lastMessage || "Click to start conversation"}
                        </p>
                        {getRoleBadge(contact.role)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT MAIN CHAT AREA */}
        <div
          className={`${
            !showMobileSidebar ? "flex" : "hidden"
          } md:flex flex-col flex-1 bg-slate-900/60 h-full relative`}
        >
          {activeContact ? (
            <>
              {/* CHAT HEADER */}
              <div className="p-3.5 px-6 bg-slate-900/90 border-b border-white/10 flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setShowMobileSidebar(true)}
                    className="md:hidden text-slate-300 hover:text-white p-1"
                  >
                    <FaArrowLeft />
                  </button>

                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-cyan-500/40 flex items-center justify-center font-bold text-white">
                      {activeContact.name?.charAt(0).toUpperCase()}
                    </div>
                    {onlineUsers.includes(activeContact._id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      {activeContact.name}
                      {getRoleBadge(activeContact.role)}
                    </h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5">
                      {isTyping ? (
                        <span className="text-cyan-400 font-semibold animate-pulse flex items-center gap-1">
                          <FaCommentDots /> typing...
                        </span>
                      ) : onlineUsers.includes(activeContact._id) ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <FaCircle className="text-[8px]" /> Online
                        </span>
                      ) : (
                        <span className="text-slate-400">Offline</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* MESSAGES THREAD (WHATSAPP BG STYLE) */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#090d16]/90 relative">
                
                {/* WhatsApp Style Background Watermark Pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                    <FaComments className="text-4xl text-cyan-400/40 mb-2" />
                    <p className="font-semibold text-sm">No message history yet</p>
                    <p className="text-xs text-slate-500">Send a message below to start chatting!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.senderId === currentUser._id;
                    const msgTime = new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={msg._id || index}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[85%] md:max-w-[70%] p-3.5 px-4 rounded-2xl shadow-md text-sm relative transition-all ${
                            isMe
                              ? "bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-br-none shadow-[0_2px_10px_rgba(56,189,248,0.2)]"
                              : "bg-slate-800/90 border border-white/10 text-slate-100 rounded-bl-none"
                          }`}
                        >
                          {!isMe && (
                            <p className="text-[11px] font-bold text-cyan-400 mb-1">
                              {msg.senderName || activeContact.name}
                            </p>
                          )}

                          <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>

                          <div
                            className={`flex items-center gap-1 justify-end text-[10px] mt-1.5 ${
                              isMe ? "text-cyan-100" : "text-slate-400"
                            }`}
                          >
                            <span>{msgTime}</span>
                            {isMe && <FaCheckDouble className="text-xs text-cyan-200" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Real-time Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 bg-slate-800/80 border border-white/10 p-2.5 px-4 rounded-2xl w-fit text-xs text-cyan-300">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
                    {activeContact.name} is typing...
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* INPUT TOOLBAR */}
              <form
                onSubmit={sendMessage}
                className="p-3 px-4 bg-slate-900/90 border-t border-white/10 flex items-center gap-3"
              >
                <input
                  type="text"
                  placeholder={`Type a message to ${activeContact.name}...`}
                  value={messageInput}
                  onChange={handleInputChange}
                  className="flex-1 bg-slate-950/90 border border-cyan-500/30 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
                />

                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className={`p-3.5 rounded-2xl text-white font-bold transition-all flex items-center justify-center shadow-md ${
                    messageInput.trim()
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:shadow-[0_0_15px_rgba(56,189,248,0.4)] cursor-pointer"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <FaPaperPlane className="text-sm" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <FaComments className="text-5xl text-cyan-400/40 mb-3" />
              <h3 className="text-lg font-bold text-white">WhatsApp Direct Messaging</h3>
              <p className="text-xs text-slate-400">Select a teacher or student from the sidebar to chat.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Chatpage;