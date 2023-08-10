export async function logCompletionDecorator<T>(
  promise: Promise<T>,
  message: string,
) {
  const r = await promise;
  console.log(message);
  return r;
}
