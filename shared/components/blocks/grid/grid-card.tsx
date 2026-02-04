import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { stegaClean } from "next-sanity";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/shared/sanity/lib/image";
import { PAGE_QUERYResult, ColorVariant } from "@/sanity.types";

type Block = NonNullable<NonNullable<PAGE_QUERYResult>["blocks"]>[number];
type GridRow = Extract<Block, { _type: "grid-row" }>;
type GridColumn = NonNullable<NonNullable<GridRow["columns"]>>[number];
type GridCard = Extract<GridColumn, { _type: "grid-card" }>;

interface GridCardProps extends Omit<GridCard, "_type" | "_key"> {
  color?: ColorVariant;
}

export default function GridCard({
  color,
  title,
  excerpt,
  image,
  link,
}: GridCardProps) {
  return (
    <Link
      key={title}
      className="flex w-full rounded-lg ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group text-center"
      href={link?.href ?? "#"}
      target={link?.target ? "_blank" : undefined}>
      <div
        className={cn(
          "flex w-full flex-col items-center justify-between overflow-hidden transition ease-in-out rounded-lg p-4",
          color === "primary"
            ? "group-hover:border-primary-foreground/50"
            : "group-hover:border-primary"
        )}>
        <div>
          {image && image.asset?._id && (
            <div className="flex items-center justify-center">
              <div className="mb-4 relative h-[15rem] sm:h-[20rem] md:h-[25rem] lg:h-[9.5rem] xl:h-[12rem] rounded-full overflow-hidden aspect-square border-4 border-primary">
                <Image
                  src={urlFor(image).url()}
                  alt={image.alt || ""}
                  placeholder={
                    image?.asset?.metadata?.lqip ? "blur" : undefined
                  }
                  blurDataURL={image?.asset?.metadata?.lqip || ""}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover rounded-full"
                  quality={100}
                />
              </div>
            </div>
          )}
          <div
            className={cn(color === "primary" ? "text-background" : undefined)}>
            {title && (
              <div className="flex justify-center items-center mb-4">
                <h3 className="font-bold text-2xl">{title}</h3>
              </div>
            )}
            {excerpt && <p>{excerpt}</p>}
          </div>
        </div>
        <Button
          className="mt-6"
          size="lg"
          variant={stegaClean(link?.buttonVariant)}
          asChild>
          <div>{link?.title ?? "Learn More"}</div>
        </Button>
      </div>
    </Link>
  );
}
