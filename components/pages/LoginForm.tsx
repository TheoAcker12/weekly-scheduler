import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import Alert from "../ui/Alert";
import { GenericError } from "@/lib/types";
import { Button } from "../ui/Button";
import { useRouter } from "next/router";

type Props = {
}

// for react-hook-form
type Inputs = {
  username: string,
  password: string
}

export default function LoginForm({}: Props) {
  const router = useRouter();

  const { register, handleSubmit, watch, formState} = useForm<Inputs>();

  const onSubmit = async function (data: Inputs) {
    // successful signin will redirect to homepage, otherwise error will be added to searchParams
    await signIn('credentials', {
      username: data.username,
      password: data.password,
      callbackUrl: '/home'
    });
  }

  // check for error
  const queryError = router.query['error'];
  const errorMsg = 'Invalid credentials. Your username and/or password was incorrect.'; // unspecific for security reasons
  let errors: GenericError[] | undefined = undefined;
  if (queryError !== undefined) errors = [{msg: errorMsg}]

  return (
    <div>
      <Alert errors={errors} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          id='name-input'
          type='text'
          labelText='Username:'
          autoComplete='username'
          {...register('username')}
          required
        />
        <Input
          id='password-input'
          type='password'
          labelText='Password:'
          autoComplete='password'
          {...register('password')}
          required
        />
        <Button type="submit">Log In</Button>
      </form>
    </div>
  );
}