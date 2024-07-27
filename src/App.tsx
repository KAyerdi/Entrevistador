import { useState } from "react";


const recognition = new window.webkitSpeechRecognition();


recognition.continuous = true;
recognition.lang = "es-AR";


function App() {

  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [buffer, setBuffer] = useState<string>("");
  const [messages, setMessages] = useState<{
    role: 'user' | 'system' | 'assistant',
    content: string
  }[]>([{
  role: 'system',
  content: 'Sos una entrevistadora IT evaluando a un candidato para una posicion React Junior.'
  }])
  function handleStartRecording(){
    setIsRecording(true)

    recognition.start()

    recognition.addEventListener("result", event => {
      const buffer = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join(" ")

      setBuffer(buffer)
    })
  }

  async function handleEndRecording(){
    setIsRecording(false);

    recognition.stop();

    const draft = structuredClone(messages)
    draft.push({
      role: "user",
      content: buffer
    })

    const answer = await fetch ("http://localhost:11434/api/chat", {
      method: "POST",
      body: JSON.stringify({
        model: "llama3",
        stream: false,
        messages: draft,
      }),
    })
    .then(
      (response) => response.json() as Promise<{message: {role: 'assistant'; content: string}}>
    )
    .then((response) => response.message)

  draft.push(answer);
  setMessages(draft);
  
  }

  return (
    <main className="container m-auto grid min-h-screen grid-rows-[auto,1fr,auto] px-4">
      <header className="text-xl font-bold leading-[4rem]">EntrevistAIdor</header>
      <section className="py-8">
        <button
        onClick={isRecording ? handleEndRecording : handleStartRecording}
        className={` h-64 w-64 rounded-full transition-colors border-8 border-neutral-600> ${isRecording ? "bg-red-700" : "bg-red-500"}`}
        />
      </section>
      <footer className="text-center leading-[4rem] opacity-70">
        © {new Date().getFullYear()} EntrevistAIdor
      </footer>
    </main>
  );
}

export default App;
