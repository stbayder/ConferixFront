import dayjs from "dayjs";

export default function formatDate(dateText){
    return dayjs(dateText).format("DD-MM-YY");
}

export function truncateName(name,chars) {
    return name.length > chars ? name.slice(0, chars) + '...' : name;
  }