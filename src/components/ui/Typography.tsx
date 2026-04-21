import type { HTMLAttributes } from 'react'

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4'

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel
  size?: 'xl' | 'lg' | 'md' | 'sm'
}

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: 'lg' | 'md' | 'sm' | 'xs'
  muted?: boolean
}

const headingSizes: Record<NonNullable<HeadingProps['size']>, string> = {
  xl: 'text-3xl font-bold',
  lg: 'text-2xl font-semibold',
  md: 'text-xl font-semibold',
  sm: 'text-lg font-medium',
}

const subheadingSizes: Record<NonNullable<TextProps['size']>, string> = {
  lg: 'text-lg font-medium',
  md: 'text-base font-medium',
  sm: 'text-sm font-medium',
  xs: 'text-xs font-medium',
}

const paragraphSizes: Record<NonNullable<TextProps['size']>, string> = {
  lg: 'text-lg',
  md: 'text-base',
  sm: 'text-sm',
  xs: 'text-xs',
}

export const Heading = ({
  as: Tag = 'h1',
  size = 'lg',
  className = '',
  children,
  ...props
}: HeadingProps) => (
  <Tag
    className={` tracking-tight text-[30px] ${headingSizes[size]} ${className}`}
    {...props}
  >
    {children}
  </Tag>
)

export const Subheading = ({
  size = 'sm',
  muted = false,
  className = '',
  children,
  ...props
}: TextProps) => (
  <p
    className={`text-[20px] ${className}`}
    {...props}
  >
    {children}
  </p>
)

export const Paragraph = ({
  size = 'sm',
  muted = false,
  className = '',
  children,
  ...props
}: TextProps) => (
  <p
    className={`${paragraphSizes[size]}  text-[16px]  leading-relaxed ${className}`}
    {...props}
  >
    {children}
  </p>
)
