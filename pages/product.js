import axios from "axios"

function Product() {
  return <>product</>
}

Product.getInitialProps = async ({ query: { _id } }) => {
  const url = "http://localhost:3000/api/product"
  const payload = { params: { _id } }
  const response = await axios.get(url, payload)
}

export default Product
