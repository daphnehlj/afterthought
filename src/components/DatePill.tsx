import { format } from "date-fns";

interface DatePillProps {
  date?: Date;
}

const DatePill = ({ date = new Date() }: DatePillProps) => {
  return (
    <div className="inline-flex items-center px-6 py-2 rounded-full border-2 border-foreground/20 bg-background">
      <span className="font-pixel text-sm">
        {format(date, "MMM d, yyyy")}
      </span>
    </div>
  );
};

export default DatePill;
