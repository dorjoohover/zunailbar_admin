import React, { useEffect, useState } from 'react'

export default function countDown() {
 const [timeleft, setTimeLeft] = useState(5 * 60);

 useEffect(() => {
  const interval = setInterval(() => {
   setTimeLeft(prevTime => prevTime - 1);
  )
  }, 1000);
  
 }, []);

  return (
    <div>countDown</div>
  )
}
