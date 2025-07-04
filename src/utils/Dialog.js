import Swal from 'sweetalert2';

const Dialog = Swal.mixin({
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Ya',
  cancelButtonText: 'Batal',
});

export default Dialog;