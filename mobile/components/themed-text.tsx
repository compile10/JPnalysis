import { Text, TextInput, type TextInputProps, type TextProps } from "react-native";
import { twMerge } from "tailwind-merge";

export type ThemedTextProps = TextProps & {
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
  className?: string;
};

const defaultTextClass = "font-geist-reg text-foreground";
const defaultTextInputClass =
  "p-4 rounded-xl border-2 border-input text-base bg-muted placeholder:text-muted-foreground";

const typeStyles = {
  default: "text-base leading-6",
  defaultSemiBold: "text-base leading-6 font-semibold",
  title: "text-3xl font-bold leading-8",
  subtitle: "text-xl font-bold",
  link: "leading-8 text-base text-primary",
};

export function ThemedText({
  style,
  type = "default",
  className,
  ...rest
}: ThemedTextProps) {
  return (
    <Text
      className={twMerge(defaultTextClass, typeStyles[type], className)}
      style={style}
      {...rest}
    />
  );
}

export function ThemedTextInput({
  className,
  ...rest
}: TextInputProps) {
  return (
    <TextInput
      className={twMerge(defaultTextClass, defaultTextInputClass, className)}
      {...rest}
    />
  );
}
