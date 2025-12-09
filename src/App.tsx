import React from 'react';
import Video360Viewer from './components/Video360Viewer';

const App: React.FC = () => {
  return (
    <div className="w-full h-screen bg-gray-900 text-white overflow-hidden">
      <Video360Viewer />
    </div>
  );
};

export default App;
