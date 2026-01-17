import { useNavigate } from "react-router-dom";
import BookSpine from "./BookSpine";
import { motion } from "framer-motion";

interface BookshelfProps {
  booksTranslateX?: string;
}

const Bookshelf = ({ booksTranslateX = "translate-x-[250px]" }: BookshelfProps) => {
  const navigate = useNavigate();

  const books = [
    { title: "Reflections", color: "analysis" as const, path: "/analysis", slant: "left" as const },
    { title: "Daily Thoughts", color: "sage" as const, path: "/write", slant: "none" as const },
    { title: "History", color: "olive" as const, path: "/history", slant: "none" as const },
    { title: "Profile", color: "cream" as const, path: "/profile", slant: "left" as const },
  ];

  return (
    <div className="relative">
      {/* Books */}
      <motion.div 
        className={`flex items-end justify-center gap-0.5 px-4 ${booksTranslateX}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        
        {books.map((book, index) => (
          <motion.div
            key={book.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={book.slant === "left" ? "ml-0.5" : ""}
          >
            <BookSpine
              title={book.title}
              color={book.color}
              onClick={() => navigate(book.path)}
              slant={book.slant}
              className={index === 0 ? "h-52" : index === 1 ? "h-48" : "h-44"}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Shelf */}
      <div className="relative mt-0 h-4 mx-2">
        <div className="absolute inset-0 bg-gradient-to-b from-[#846851] via-[#846851]/90 to-[#411E03] rounded-b-sm shadow-lg" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#D6B38D]/40" />
      </div>
    </div>
  );
};

export default Bookshelf;