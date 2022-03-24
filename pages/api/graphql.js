export default async function handler(req, res) {
  const result = await fetch(
    "https://ks-simple-product-feed.hieunguyen.dev/api/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    }
  )
    .then((res) => res.json())
    .catch((e) => {
      console.error(e);
    });
  console.log({ result });
  res.status(200).json(result);
}
