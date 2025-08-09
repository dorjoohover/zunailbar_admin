export default function ConnectGoogle() {
  const connect = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  return <button onClick={connect}>Connect Google Calendar</button>;
}
