import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ImageComponent = () => {
  const [src, setSrc] = useState("");

  return (
    <div>
      <div>
        <input type="url" onChange={(e) => setSrc(e.target.value)} placeholder="Enter url here" style={{
          border: '1px solid black',
          width: '100%',
          fontSize: '1.2rem',
          marginTop: '1rem'
        }} />
      </div>
      {src && <img src={src} alt="Entered"  style={{
        height: 'calc(100vh - 5rem)',
        display:"flex",
        justifyContent:"center",
        margin:"auto",
        
      }} />}
    </div>
  );
};

export default ImageComponent;
