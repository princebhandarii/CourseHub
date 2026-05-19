import { Link } from 'react-router-dom';
import { GraduationCap, Twitter, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-3">
              <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white dark:text-gray-900" />
              </div>
              CourseHub
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Empowering learners worldwide with world-class online education. Learn at your own pace.
            </p>
            <div className="flex gap-3 mt-4">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Platform', links: [['All Courses', '/courses'], ['About Us', '/about'], ['Contact', '/contact']] },
            { title: 'Account',  links: [['Login', '/login'], ['Sign Up', '/signup'], ['My Courses', '/my-courses'], ['Wishlist', '/wishlist']] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} CourseHub. All rights reserved.</p>
          <p className="text-xs text-gray-400">Built with Prince ❤️</p>
        </div>
      </div>
    </footer>
  );
}
