
interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div>
      <h1 className='text-h1 font-bold text-foreground mb-2'>
        {title}
      </h1>
      <p className='text-muted-foreground'>
        {description}
      </p>
    </div>
  );
}