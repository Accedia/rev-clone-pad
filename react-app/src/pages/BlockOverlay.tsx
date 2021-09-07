import React from 'react';

const BlockOverlay: React.FC = () => {
  return (
    <div className="block-overlay">
      <img src={process.env.PUBLIC_URL + '/block-mouse-icon.png'} alt="Block-mouse-icon" width="600" />
      <h1>Please do not touch the mouse and keyboard during population</h1>
    </div>
  );
};

export default BlockOverlay;
