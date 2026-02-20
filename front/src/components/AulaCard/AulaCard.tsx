import styles from "./AulaCard.module.scss";

type Props = {
  aula: any;
  onClick?: () => void;
};

export default function AulaCard({ aula, onClick }: Props) {
  return (
    <div className={styles.card} onClick={onClick}>
      <h3>{aula.titulo}</h3>
      <p>{aula.descricao}</p>
    </div>
  );
}
