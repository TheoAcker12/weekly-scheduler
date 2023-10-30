import { GenericError, HeadingLevel } from "@/lib/types";
import Heading from "./Heading";

type Props = {
  headingLevel?: HeadingLevel, // appropriate heading level to use when displaying errors
  errors?: GenericError[] // not really linked if no id, but seems best to leave room for the possibility
}

function getMsg(error: GenericError) {
  return error.msg ?? error.error ?? 'no msg provided';
}

export default function Alert({headingLevel, errors}: Props) {
  return (
    <div role='alert'>
      {(errors && errors.length > 0) ? <>
        <Heading level={headingLevel ?? '2'}>Errors:</Heading>
        <ul>
          {errors.map((value, index) =>
            <li key={index}>
              {value.id ? <a href={`#${value.id}`}>{getMsg(value)}</a> : <span>{getMsg(value)}</span>}
            </li>
          )}
        </ul>
      </>: ''}
    </div>
  )
}