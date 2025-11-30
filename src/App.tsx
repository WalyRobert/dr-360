import React from 'react';
import Video360Viewer from './components/Video360Viewer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#D4AF37' }}>DR 360°</h1>
          <p className="text-xl text-gray-300">Dodge Recian - Experiência Imersiva Premium</p>
          <p className="text-gray-400 mt-2">Desfrute de vídeos 360 graus com rastreamento de cabeça e modo VR</p>
        </header>
        
        <main>
          <Video360Viewer />
        </main>
        
        <footer className="mt-16 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>© 2024 DR 360° - Dodge Recian. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
