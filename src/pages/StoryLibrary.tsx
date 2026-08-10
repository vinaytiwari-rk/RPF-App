import React, { useState, useEffect } from 'react';
import { BookOpen, Headphones, Play, Pause, Square, ArrowLeft } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  author: string;
  content: string;
  coverImage: string;
}

const STORIES: Story[] = [
  {
    id: 's1',
    title: 'The Tortoise and the Hare',
    author: 'Aesop',
    coverImage: 'https://images.unsplash.com/photo-1498677238477-94e5014b9887?auto=format&fit=crop&q=80&w=400&h=300',
    content: `There once was a speedy hare who bragged about how fast he could run. Tired of hearing him boast, Slow and Steady, the tortoise, challenged him to a race. All the animals in the forest gathered to watch.

Hare ran down the road for a while and then and paused to rest. He looked back at Slow and Steady and cried out, "How do you expect to win this race when you are walking along at your slow, slow pace?"

Hare stretched himself out alongside the road and fell asleep, thinking, "There is plenty of time to relax."

Slow and Steady walked and walked. He never, ever stopped until he came to the finish line.

The animals who were watching cheered so loudly for Tortoise, they woke up Hare. Hare stretched and yawned and began to run again, but it was too late. Tortoise was over the line.

After that, Hare always reminded himself, "Don't brag about your lightning pace, for Slow and Steady won the race!"`
  },
  {
    id: 's2',
    title: 'The Fox and the Grapes',
    author: 'Aesop',
    coverImage: 'https://images.unsplash.com/photo-1596395819057-e37f55a8516b?auto=format&fit=crop&q=80&w=400&h=300',
    content: `One hot summer's day a Fox was strolling through an orchard till he came to a bunch of Grapes just ripening on a vine which had been trained over a lofty branch.

"Just the thing to quench my thirst," quoth he.

Drawing back a few paces, he took a run and a jump, and just missed the bunch. Turning round again with a One, Two, Three, he jumped up, but with no greater success. Again and again he tried after the tempting morsel, but at last had to give it up, and walked away with his nose in the air, saying:

"I am sure they are sour."

It is easy to despise what you cannot get.`
  },
  {
    id: 's3',
    title: 'The Boy Who Cried Wolf',
    author: 'Aesop',
    coverImage: 'https://images.unsplash.com/photo-1589410141697-3932e60da309?auto=format&fit=crop&q=80&w=400&h=300',
    content: `A shepherd-boy, who watched a flock of sheep near a village, brought out the villagers three or four times by crying out, "Wolf! Wolf!" and when his neighbors came to help him, laughed at them for their pains.

The Wolf, however, did truly come at last. The Shepherd-boy, now really alarmed, shouted in an agony of terror: "Pray, do come and help me; the Wolf is killing the sheep"; but no one paid any heed to his cries, nor rendered any assistance. The Wolf, having no cause of fear, at his leisure lacerated or destroyed the whole flock.

There is no believing a liar, even when he speaks the truth.`
  }
];

const StoryLibrary: React.FC = () => {
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    // Cleanup TTS when component unmounts
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlay = () => {
    if (!activeStory) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(activeStory.content);
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      
      // Try to find a good English voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha')));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.rate = 0.9; // Slightly slower for better reading comprehension
      
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const closeStory = () => {
    handleStop();
    setActiveStory(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn max-w-6xl mx-auto space-y-6">
      
      {!activeStory ? (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-[var(--rp-primary)]" />
                Audiobook & Story Library
              </h1>
              <p className="text-gray-600">Read classic literature or listen to them via TTS.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STORIES.map(story => (
              <div 
                key={story.id}
                onClick={() => setActiveStory(story)}
                className="glass-card rounded-2xl overflow-hidden cursor-pointer group hover:shadow-premium transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                  <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight">{story.title}</h3>
                  <p className="text-sm text-gray-600">By {story.author}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={closeStory}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Library
          </button>

          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="h-64 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <img src={activeStory.coverImage} alt={activeStory.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{activeStory.title}</h1>
                <p className="text-gray-300 text-lg">By {activeStory.author}</p>
              </div>
            </div>

            {/* Audio Player Controls */}
            <div className="bg-gray-50 border-b border-gray-100 p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Text-to-Speech</p>
                  <p className="text-xs text-gray-500">Listen to the story</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isPlaying ? (
                  <button onClick={handlePause} className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-md">
                    <Pause className="w-5 h-5" />
                  </button>
                ) : (
                  <button onClick={handlePlay} className="w-12 h-12 bg-[var(--rp-primary)] text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors shadow-md pl-1">
                    <Play className="w-5 h-5" />
                  </button>
                )}
                {(isPlaying || isPaused) && (
                  <button onClick={handleStop} className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors">
                    <Square className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-8 sm:p-12 bg-white">
              <div className="prose prose-lg max-w-none text-gray-800 font-serif leading-relaxed space-y-6 text-justify">
                {activeStory.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StoryLibrary;
