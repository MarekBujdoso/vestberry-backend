-- This is an empty migration.

CREATE OR REPLACE FUNCTION public.get_book_changes_by_date(related_date timestamp with time zone)
RETURNS TABLE(id integer, "bookId" integer, status "BookStatus", "createdById" integer, "createdAt" timestamp without time zone, "updatedAt" timestamp without time zone, title text, author text, "yearOfPublication" integer, rating integer)
LANGUAGE plpgsql
AS $function$
BEGIN 
  RETURN query 
  SELECT
    bc."id",
    bc."bookId",
    bc."status",
    bc."createdById",
    bc."createdAt",
    bc."updatedAt",
    book.title,
    book.author,
    book."yearOfPublication",
    book.rating
  FROM
    "BookChanges" as bc
    INNER JOIN "Book" as book
      ON book.id = bc."bookId"
    INNER JOIN
      (
        SELECT
          MAX(bc_join."updatedAt") AS latest_date,
          bc_join."bookId" AS last_book_id
        FROM
          "BookChanges" as bc_join
        WHERE
          bc_join."updatedAt" <= related_date
          GROUP BY 
            bc_join."bookId"
      ) AS last
    ON bc."updatedAt" = last.latest_date
      AND bc."bookId" = last.last_book_id
  WHERE
    bc."updatedAt" <= related_date
  ORDER BY
    "updatedAt" DESC;
END;
$function$;
