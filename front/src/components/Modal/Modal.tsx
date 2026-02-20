import styles from "./Modal.module.scss";

type Props = {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
};

export default function Modal({ open, title, children, onClose }: Props) {
  if (!open) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        {title && <h3>{title}</h3>}

        <div>{children}</div>

        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
