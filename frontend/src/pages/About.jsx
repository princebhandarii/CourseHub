// About.jsx
import { GraduationCap, Users, Globe, Award, BookOpen, Zap } from 'lucide-react';
export function About() {
  const team = [
    { name: 'Prince',  role: 'CEO & Co-Founder',   emoji: '🦁' },
   
  ];
  const values = [
    { icon: BookOpen, title: 'Quality First',    desc: 'Every course is reviewed for accuracy and depth.' },
    { icon: Users,    title: 'Community Driven', desc: 'Learn together, grow together.' },
    { icon: Globe,    title: 'Accessible',        desc: 'World-class education for everyone, everywhere.' },
    { icon: Zap,      title: 'Always Updated',   desc: 'Courses evolve with the industry.' },
  ];
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <div className="w-16 h-16 rounded-2xl bg-gray-900 dark:bg-white flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-8 h-8 text-white dark:text-gray-900" />
        </div>
        <h1 className="text-4xl font-bold mb-4">About CourseHub</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          We believe that education is the most powerful tool to change the world. CourseHub was built to make quality learning accessible to everyone, everywhere.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-16">
        {[['500+','Courses'],['50K+','Students'],['100+','Instructors'],['4.8★','Avg Rating']].map(([v,l])=>(
          <div key={l} className="card p-6 text-center">
            <div className="text-3xl font-bold mb-1">{v}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{l}</div>
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-bold text-center mb-8">Our Values</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
        {values.map(({icon:Icon,title,desc})=>(
          <div key={title} className="card p-5">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-bold text-center mb-8">Meet the Team</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        {team.map(({name,role,emoji})=>(
          <div key={name} className="card p-5 text-center">
            <div className="text-4xl mb-3">{emoji}</div>
            <div className="font-semibold text-sm">{name}</div>
            <div className="text-xs text-gray-400 mt-0.5">{role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default About;
