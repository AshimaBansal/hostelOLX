// Slice an array into one page and return the page plus meta info.
export function paginate(items, page = 1, limit = 12) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  return {
    data: items.slice(start, start + limit),
    meta: { page, limit, total, totalPages },
  };
}
