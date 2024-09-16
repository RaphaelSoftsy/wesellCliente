/* eslint-disable react/prop-types */
import styles from "./cardproduto.module.css";
import formatCurrencyBR from "../../hooks/formatCurrency";
import { Link, useNavigate } from "react-router-dom";
import useContexts from "../../hooks/useContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { url_base, url_img } from "../../services/apis";
import { FiTrash2 } from "react-icons/fi";
import ImageDefault from "../../assets/imageDefault.png";

export default function CardProduto({ produto, btnVisivel, removeFavorites }) {
  const { addToCart } = useContexts();
  const [srcImage, setSrcImage] = useState("");
  const [valorParcela, setValorParcela] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (produto?.lojista && produto?.lojista?.possuiParcelamento === "S") {
      let valor = produto.precoVenda / produto.lojista.maximoParcelas;
      let valorFixado = Math.floor(valor * 100) / 100;
      setValorParcela(valorFixado.toFixed(2).replace(".", ","));
    } else if (produto.possuiParcelamento === "S") {
      let valor = produto.precoVenda / produto.maximoParcelas;
      let valorFixado = Math.floor(valor * 100) / 100;
      setValorParcela(valorFixado.toFixed(2).replace(".", ","));
    } else {
      setValorParcela(null);
    }
    async function getImagensProduto() {
      await axios
        .get(url_base + `/imagens/produto/${produto.idProduto}`)
        .then((response) => {
          if (response.data.length > 0) {
            let caminho = response.data[0].imagem.split("ROOT");
            setSrcImage(`${url_img}${caminho[1]}`);
          }
        })
        .catch((error) => {
          console.log(error);
          console.log(error.message);
        });
    }
    getImagensProduto();
  }, [srcImage]);

  const encodeCustom = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const produtoNome = encodeCustom(produto.nomeProduto)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/\//g, "-");

  return (
    <div className={`${styles.cardProduto}`}>
      <Link
        to={`/produto/${produto.idProduto}/${produtoNome}`}
        className={styles.areaImg}
      >
        <img
          src={srcImage ? srcImage : ImageDefault}
          alt={produto.descrProduto}
        />
      </Link>
      <section className={styles.infoProduto}>
        <Link
          to={`/produto/${produto.idProduto}/${produtoNome}`}
          className={styles.areaDescricao}
        >
          <h6 className={styles.descricao}>{produto.nomeProduto}</h6>
        </Link>
        <div>
          <p className={styles.valor}>
            {produto.precoVenda && formatCurrencyBR(produto.precoVenda)}
          </p>
          {valorParcela && (
            <p className={styles.infoParcelas}>
              em até{" "}
              {produto?.lojista?.maximoParcelas ?? produto?.maximoParcelas}x de{" "}
              {valorParcela} sem juros
            </p>
          )}
        </div>
        <section className={styles.areaBtn}>
          <button
            className={styles.btnBuy}
            type="button"
            onClick={() => {
              addToCart({ ...produto, qtd: 1, imagem: srcImage }),
                navigate("/carrinho");
            }}
          >
            Adicionar ao carrinho
          </button>
          {btnVisivel && (
            <button
              className={`${styles.btnBuy2} ms-2 px-2 btn btn-sm btn-danger`}
              type="button"
              onClick={() => removeFavorites(produto.idProduto)}
            >
              <FiTrash2 size={20} />
            </button>
          )}
        </section>
      </section>
    </div>
  );
}
