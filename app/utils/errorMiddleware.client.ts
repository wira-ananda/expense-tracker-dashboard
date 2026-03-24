export default function errorMiddleware(err: Error) {
  console.log('ERROR:', err)

  const message = err?.message || 'Terjadi kesalahan.'

  alert(message)
}
