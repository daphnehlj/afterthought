import { useNavigate } from "react-router-dom";
import BookSpine from "./BookSpine";
import { motion } from "framer-motion";

const Bookshelf = () => {
  const navigate = useNavigate();

  const books = [
    { title: "Daily Thoughts", color: "sage" as const, path: "/write" },
    { title: "History", color: "olive" as const, path: "/history" },
    { title: "Projects", color: "cream" as const, path: "/analysis" },
  ];

  return (
    <div className="relative">
      {/* Books */}
      <motion.div 
        className="flex items-end justify-center gap-1 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Decorative checked book */}
        <BookSpine title="" color="checked" className="h-40 w-10 opacity-70" />
        
        {books.map((book, index) => (
          <motion.div
            key={book.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <BookSpine
              title={book.title}
              color={book.color}
              onClick={() => navigate(book.path)}
              className={index === 0 ? "h-52" : index === 1 ? "h-48" : "h-44"}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Shelf */}
      <div className="relative mt-0 h-4 mx-2">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 rounded-b-sm shadow-lg" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-700/50" />
      </div>
    </div>
  );
};

export default Bookshelf;
