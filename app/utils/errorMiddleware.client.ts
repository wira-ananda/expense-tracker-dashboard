export default function errorMiddleware(err: any) {
  console.log('ERROR:', err)

  const message =
    err?.response?.data?.message || err?.message || 'Terjadi kesalahan.'

  alert(message)
}
